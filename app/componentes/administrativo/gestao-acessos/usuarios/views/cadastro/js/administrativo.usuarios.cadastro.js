/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.2 - 05/10/2015
 *  - Correção em buscaEmpresas
 *
 *  Versão 1.0.1 - 18/09/2015
 *  - Busca somente filiais ativas
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-usuarios-cadastro", []) 

.controller("administrativo-usuarios-cadastroCtrl", ['$scope',
                                                     '$state',
                                                     '$stateParams',
                                                     '$timeout',
                                                     '$http',
                                                     /*'$campos',*/
                                                     '$webapi',
                                                     '$apis',
                                                     '$filter',
                                                     function($scope,$state,$stateParams,$timeout,$http,/*$campos,*/
                                                              $webapi,$apis,$filter){ 
    
    var divPortletBodyUsuarioCadPos = 0; // posição da div que vai receber o loading progress
    $scope.temPermissao = false;  // indica se tem permissão para acessar esta página                               
    $scope.tela = {tipo:'Cadastro', acao:'Cadastrar'};
    // Tab
    $scope.tabCadastro = 1;
    // Dados
    $scope.empresas = [];
    $scope.old = {pessoa:null,usuario:null,roles:[],gruposempresasvendedor:[]};
    $scope.pessoa = {id:0, nome:'', data_nasc:''/*null*/, telefone:'', ramal:''};
    $scope.usuario = {login:'', email:'', grupoempresa:'', empresa:''};
    $scope.roleSelecionada = undefined;
    var addidsgrupoempresavendedor = [];
    var removeidsgrupoempresavendedor = [];                                                     
    // Vendedor
    $scope.grupoempresavendedor = { busca : '', selecionado : undefined };
    $scope.gruposempresasvendedor = [];                                                    
    // Flags
    $scope.abrirCalendarioDataNasc = false;
    var dataValida = false;
    var loginValido = false;
    var emailValido = false;
    $scope.validandoLogin = false;
    $scope.validandoEmail = false;
    $scope.obtendoRoles = false; 
    //$scope.temRoleSelecionada = false;
    $scope.pesquisandoGruposEmpresas = false;  
    $scope.pesquisandoEmpresas = false;
    $scope.cadastrando = false;
                                                                                                              
                                                         
                                                         
                                                         
                                                         
    // Usuário da alteração
    /**
      * Obtém e atualiza informações do formulário do usuário
      */
    var atualizaDadosDoUsuario = function(){
        // Atualiza informações
        loginValido = emailValido = true;
        $scope.usuario.email = $scope.old.usuario.ds_email;
        $scope.usuario.login = $scope.old.usuario.ds_login;
        
        // PESSOA
        $scope.pessoa.nome = $scope.old.pessoa.nm_pessoa;
        if($scope.old.pessoa.dt_nascimento !== null){ 
            dataValida = true;
            $scope.pessoa.data_nasc = $scope.getDataString($scope.old.pessoa.dt_nascimento);
        }
        $scope.old.pessoa.dt_nascimento = $scope.pessoa.data_nasc; // deixa no mesmo formato
        if($scope.old.pessoa.nu_telefone !== null) 
            $scope.pessoa.telefone = $scope.old.pessoa.nu_telefone;
        $scope.old.pessoa.nu_telefone = $scope.pessoa.telefone; // deixa em string
        if($scope.old.pessoa.nu_ramal !== null) $scope.pessoa.ramal = $scope.old.pessoa.nu_ramal;
        else $scope.old.pessoa.nu_ramal = $scope.pessoa.ramal; // deixa em string
    };                                                   
    /**
      * Obtém todas as roles cadastradas
      */
    var obtemRoles = function(){
        $scope.obtendoRoles = true;  
        $webapi.get($apis.getUrl($apis.administracao.webpagesroles, 
                                 [$scope.token, 3, /*$campos.administracao.webpagesroles.RoleName*/ 101])) // ordenado pelo nome
            .then(function(dados){
                    $scope.obtendoRoles = false;
                    $scope.roles = dados.Registros;
                    // Atualiza informações
                    if($scope.old.roles !== null && $scope.old.roles.length > 0){
                        var old = $scope.old.roles[0];
                        var r = $filter('filter')($scope.roles, function(r){return r.RoleId === old.RoleId;});
                        if(r && r.length > 0) $scope.roleSelecionada = r[0];
                        /*for(var k = 0; k < $scope.old.roles.length; k++){
                            var old = $scope.old.roles[k];
                            var role = $filter('filter')($scope.roles, function(r){return r.RoleId === old.RoleId;});
                            if(role.length > 0){
                                role[0].selecionado = true;
                                if(old.RolePrincipal) $scope.rolePrincipal = role[0];
                            }
                        }*/
                        $scope.handleRole();
                    }
                    $scope.hideProgress(divPortletBodyUsuarioCadPos);
                    $scope.atualizaProgressoDoCadastro(); // verificar datavalida
                  },
                  function(failData){
                     //console.log("FALHA AO OBTER ROLES: " + failData.status);
                     $scope.obtendoRoles = false;
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao requisitar informações (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyUsuarioCadPos); 
                     $scope.atualizaProgressoDoCadastro();
                  }); 
    };
    
    /**
      * Reseta as variáveis
      */
    var resetaVariaveis = function(){
        //$scope.temRoleSelecionada = false;
        $scope.roleSelecionada = undefined;
        $scope.old = {pessoa:null,usuario:null,roles:[]};
        $scope.pessoa = {id:0, nome:'', data_nasc:''/*null*/, telefone:'', ramal:''};
        $scope.usuario = {login:'', email:'', grupoempresa:'', empresa:''};    
    };
                                                         
    /**
      * Inicialização do controller
      */
    $scope.administrativoUsuariosCadastroInit = function(){
        // Quando houver uma mudança de rota => Avalia se tem informações preenchidas e 
        // solicita confirmação de descarte das mesmas. Se confirmado => muda estado                                     
        $scope.$on('mudancaDeRota', function(event, state, params){
            // Obtem o JSON de mudança
            var jsonMudanca = {state: state, params : params};            
            // Verifica se possui dados preenchidos
            if($scope.ehCadastro()){
                if($scope.pessoa.nome || $scope.pessoa.data_nasc/* !== null*/ || $scope.pessoa.telefone || $scope.pessoa.ramal || 
                   $scope.usuario.email || $scope.usuario.empresa || $scope.usuario.grupoempresa || $scope.usuario.login ||
                   $scope.roleSelecionada){//$scope.temRoleSelecionada){
                    // Exibe um modal de confirmação
                    $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja descartar as informações preenchidas?',
                         mudaEstado, {state: state, params : params},
                         'Sim', 'Não');
                }else $state.go(state, params);
            }else{
               // Verifica se teve alterações
               if(!houveAlteracoes()) $state.go(state, params); // não houve alterações  
               else{ 
                   // Houve alterações!
                   $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja descartar as informações alteradas?',
                         mudaEstado, {state: state, params : params},
                         'Sim', 'Não');
               }
            }
        });
        
        $scope.$on('alterouGrupoEmpresa', function(event){
            if($scope.usuariologado.grupoempresa){
                // Exibe a tab onde o grupo empresa aparece
                $scope.setTabCadastro(2);
                $scope.usuario.grupoempresa = $scope.usuariologado.grupoempresa; 
                if($scope.usuariologado.empresa) $scope.usuario.empresa = $scope.usuariologado.empresa;
                else $scope.selecionouGrupoEmpresa();
            }else $scope.usuario.empresa = $scope.usuario.grupoempresa = '';
            $scope.atualizaProgressoDoCadastro();
        });
        
        if(!$scope.methodsDoControllerCorrente){// || $scope.methodsDoControllerCorrente.length == 0){
            // Sem permissão nenhuma ?
            $scope.goUsuarioSemPrivilegios();
            return;
        }
        
        // Exibe o alert de progress
        $scope.showProgress(divPortletBodyUsuarioCadPos);
        // Verifica se tem parâmetros
        if($stateParams.usuario !== null){
            // Verifica se tem permissão para alterar
            if(!$scope.methodsDoControllerCorrente['atualização']){//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length == 0){
               // Não pode alterar
                $scope.hideProgress(divPortletBodyUsuarioCadPos);
                $scope.goUsuarioSemPrivilegios();
                return;  
            }
            $scope.tela.tipo = 'Alteração'; 
            $scope.tela.acao = 'Alterar';
            $scope.old.usuario = $stateParams.usuario.webpagesusers;
            $scope.old.pessoa = $stateParams.usuario.pessoa;
            $scope.old.roles = $stateParams.usuario.webpagesusersinroles;
            $scope.old.gruposempresasvendedor = $stateParams.usuario.gruposvendedor;
            if($scope.old.gruposempresasvendedor && angular.isArray($scope.old.gruposempresasvendedor)){ 
                /*for(var k = 0; k < $scope.old.gruposempresasvendedor.length; k++)
                    $scope.gruposempresasvendedor.push($scope.old.gruposempresasvendedor[k]);
                $scope.old.gruposempresasvendedor = [];
                angular.copy($scope.gruposempresasvendedor, $scope.old.gruposempresasvendedor);*/
                angular.copy($scope.old.gruposempresasvendedor, $scope.gruposempresasvendedor);
            }else $scope.old.gruposempresasvendedor = [];
            // Atualiza demais dados
            atualizaDadosDoUsuario();
            // Empresa
            if($scope.old.usuario.nu_cnpjEmpresa && $scope.old.usuario.nu_cnpjEmpresa !== null){
                $scope.usuario.empresa = {nu_cnpj: $scope.old.usuario.nu_cnpjEmpresa, 
                                          ds_fantasia: $stateParams.usuario.empresa,
                                          filial : ''};
            }
            // Grupo Empresa
            if($scope.old.usuario.id_grupo && $scope.old.usuario.id_grupo !== null){
                $scope.usuario.grupoempresa = {id_grupo: $scope.old.usuario.id_grupo, 
                                               ds_nome: $stateParams.usuario.grupoempresa};
                $scope.buscaEmpresas(); // busca filiais 
            }
            //console.log($stateParams.usuario);
            //console.log($scope.old);
        }else // Verifica se tem permissão para cadastrar
            if(!$scope.methodsDoControllerCorrente['cadastro']){//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length == 0){
            // Não pode cadastrar
            $scope.hideProgress(divPortletBodyUsuarioCadPos);
            $scope.goUsuarioSemPrivilegios();
            return;  
        }        
        $scope.temPermissao = true;
        // Obtém Roles
        obtemRoles(); 
        // Título da página
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = $scope.tela.tipo + ' de Usuário';
        $scope.setTabCadastro(1);
        if($scope.usuariologado.grupoempresa){
            $scope.usuario.grupoempresa = $scope.usuariologado.grupoempresa; 
            $scope.selecionouGrupoEmpresa(true);
        }
    };
    /**
      * Altera o estado, enviado pelo json => usado no modal de confirmação
      */
    var mudaEstado = function(json){
        $timeout(function(){$state.go(json.state, json.params);}, 500); // espera o tempo do modal se desfazer 
    }
    
    /**
      * True se for cadastro. False se for alteração
      */
    $scope.ehCadastro = function(){
        return $scope.old.usuario === null;    
    };
    /**
      * Reporta se algum progresso da tela de cadastro está em curso
      */ 
    var progressoCadastro = function(emProgresso){
        $scope.cadastrando = emProgresso;
        if(!$scope.$$phase) $scope.$apply();
    };
    
    // CADASTRO                                                     
    /**
      * Cadastra o usuário na base de dados
      */
    var cadastraUsuario = function(){
        // Não faz nada se tiver validando campos
        if($scope.validandoEmail || $scope.validandoLogin) return;
        
        // Cadastra
        progressoCadastro(true)
        $scope.showProgress(divPortletBodyUsuarioCadPos);
        //postPessoa();
        //* PESSOA
        var jsonPessoa = {};
        // Obrigatório
        jsonPessoa.nm_pessoa = $scope.pessoa.nome;
        // Não-Obrigatórios
        if($scope.pessoa.data_nasc /*!== null*/){ 
            var dt = $scope.pessoa.data_nasc.split('/');
            jsonPessoa.dt_nascimento = $filter('date')(new Date(dt[2], dt[1] - 1, dt[0], 1, 0, 0, 0), "yyyy-MM-dd HH:mm:ss");
        }
        if($scope.pessoa.telefone) jsonPessoa.nu_telefone = $scope.pessoa.telefone;
        if($scope.pessoa.ramal) jsonPessoa.nu_ramal = $scope.pessoa.ramal;
        // USUÁRIO
        var jsonUsuario = {};
        // Obrigatórios
        jsonUsuario.ds_login = $scope.usuario.login;
        jsonUsuario.ds_email = $scope.usuario.email.toLowerCase();
        // Não-Obrigatórios
        if($scope.usuario.grupoempresa.ds_nome) jsonUsuario.id_grupo = $scope.usuario.grupoempresa.id_grupo;
        if($scope.usuario.empresa.ds_fantasia) jsonUsuario.nu_cnpjEmpresa = $scope.usuario.empresa.nu_cnpj;
        // ROLES DO USUÁRIO
        var r = [];
        if($scope.roleSelecionada) r.push({RoleId : $scope.roleSelecionada.RoleId, 
                                           RolePrincipal: true});
        /*for(var k in $scope.rolesSelecionadas){ 
            var role = $scope.rolesSelecionadas[k];
            r.push({RoleId : role.RoleId, 
                    RolePrincipal: $scope.rolePrincipal ? role.RoleId === $scope.rolePrincipal.RoleId : false});
        }*/
        // JSON DE ENVIO
        var json = { 
                pessoa : jsonPessoa,
                webpagesusers : jsonUsuario,
                webpagesusersinroles : r
            };
        // Perfil Comercial pode ter grupos empresas associados
        if($scope.ehComercial($scope.roleSelecionada)) json.addidsgrupoempresavendedor = addidsgrupoempresavendedor;
        
        // Envia
        //console.log(json);
        //progressoCadastro(false);
        //$scope.hideProgress(divPortletBodyUsuarioCadPos);
        $webapi.post($apis.getUrl($apis.administracao.webpagesusers, undefined,
                                  {id: 'token', valor: $scope.token}), json)
                .then(function(dados){
                    progressoCadastro(false);
                    // Reseta os dados
                    resetaVariaveis();
                    // Hide progress
                    progressoCadastro(false);
                    $scope.hideProgress(divPortletBodyUsuarioCadPos);
                    // Volta para a tela de Usuários
                    $scope.goAdministrativoUsuarios()
                    // Exibe a mensagem de sucesso
                    $timeout(function(){$scope.showAlert('Usuário cadastrado com sucesso!', true, 'success', true)}, 500);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao cadastrar o usuário (' + failData.status + ')', true, 'danger', true);
                     progressoCadastro(false);
                     // Hide progress
                     $scope.hideProgress(divPortletBodyUsuarioCadPos);
                  });
    };
     
                                                         
    // ALTERAÇÃO
    /**
      * Retorna true se houve alterações no formulário
      */
    var houveAlteracoes = function(){
        if($scope.old.usuario === null) return false;
        // PESSOA
        if($scope.old.pessoa.nm_pessoa !== $scope.pessoa.nome){
           //console.log("HOUVE ALTERAÇÃO - PESSOA - NOME"); 
           return true;
        }
        if($scope.old.pessoa.dt_nascimento !== $scope.pessoa.data_nasc){
           //console.log("HOUVE ALTERAÇÃO - PESSOA - DATA NASC"); 
           return true; 
        }
        if($scope.old.pessoa.nu_telefone !== $scope.pessoa.telefone){
           //console.log("HOUVE ALTERAÇÃO - PESSOA - TELEFONE"); 
           return true;    
        }
        if($scope.old.pessoa.nu_ramal !== $scope.pessoa.ramal){
            //console.log("HOUVE ALTERAÇÃO - PESSOA - RAMAL"); 
            return true;
        }
           // USUÁRIO
        if($scope.old.usuario.ds_email.toLowerCase() !== $scope.usuario.email.toLowerCase()){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - EMAIL"); 
           return true; 
        }
        if($scope.old.usuario.ds_login !== $scope.usuario.login){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - LOGIN"); 
           return true; 
        } 
        if(($scope.old.usuario.id_grupo === null ^ typeof $scope.usuario.grupoempresa.id_grupo === 'undefined') ||
            ($scope.old.usuario.id_grupo !== null && typeof $scope.usuario.grupoempresa.id_grupo === 'number' && 
             $scope.old.usuario.id_grupo !== $scope.usuario.grupoempresa.id_grupo)){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - GRUPO EMPRESA");
           return true; 
        } 
        if(($scope.old.usuario.nu_cnpjEmpresa === null ^ typeof $scope.usuario.empresa.nu_cnpj === 'undefined') ||
            ($scope.old.usuario.nu_cnpjEmpresa !== null && $scope.usuario.empresa.nu_cnpj && 
             $scope.old.usuario.nu_cnpjEmpresa !== $scope.usuario.empresa.nu_cnpj)){ 
            //console.log("HOUVE ALTERAÇÃO - USUÁRIO - EMPRESA"); 
            return true;
        }
        // ROLES
        if($scope.old.roles.length === 0 || 
           (typeof $scope.old.roles[0].RoleId === 'number' && typeof $scope.roleSelecionada.RoleId === 'number' && $scope.roleSelecionada.RoleId !== $scope.old.roles[0].RoleId))
            return true;
        /*if($scope.rolesSelecionadas.length !== $scope.old.roles.length){ 
            //console.log("HOUVE ALTERAÇÃO - ROLE - LENGTH");
            return true;
        }
        for(var k = 0; k < $scope.old.roles.length; k++){
           if($filter('filter')($scope.rolesSelecionadas, function(r){return r.RoleId === $scope.old.roles[k].RoleId;}).length == 0){ 
               //console.log("HOUVE ALTERAÇÃO - ROLE");
               return true; 
           }
        }*/
        return false;
    }; 
    /**
      * Altera as informações do usuário
      */                                                     
    var alteraUsuario = function(){
        // Não faz nada se tiver validando campos
        if($scope.validandoEmail || $scope.validandoLogin) return;
        
        if($scope.old.usuario === null){ 
            console.log("NÃO HÁ DADOS ANTERIORES!");
            return;
        }
        
        progressoCadastro(true);
        $scope.showProgress(divPortletBodyUsuarioCadPos);
        
        // PESSOA
        var jsonPessoa = {};
        var alterouPessoa = false;
        if($scope.old.pessoa.nm_pessoa !== $scope.pessoa.nome){
            jsonPessoa.nm_pessoa = $scope.pessoa.nome;
            alterouPessoa = true;
        }
        if($scope.old.pessoa.dt_nascimento !== $scope.pessoa.data_nasc){
            jsonPessoa.dt_nascimento = $scope.getDataFromString($scope.pessoa.data_nasc);
            //jsonPessoa.dt_nascimento = $filter('date')(new Date($scope.pessoa.data_nasc), "yyyy-MM-dd HH:mm:ss");
            alterouPessoa = true; 
        }
        if($scope.old.pessoa.nu_telefone !== $scope.pessoa.telefone){
            jsonPessoa.nu_telefone = $scope.pessoa.telefone
            alterouPessoa = true;     
        }
        if($scope.old.pessoa.nu_ramal !== $scope.pessoa.ramal){
            jsonPessoa.nu_ramal = $scope.pessoa.ramal;
            alterouPessoa = true; 
        }
        // USUÁRIO
        
        var jsonUsuario = {id_users : $scope.old.usuario.id_users, fl_ativo : $scope.old.usuario.fl_ativo};
        var alterouUsuario = false;        
        if($scope.old.usuario.ds_email.toLowerCase() !== $scope.usuario.email.toLowerCase()){
            jsonUsuario.ds_email = $scope.usuario.email.toLowerCase(); 
            alterouUsuario = true; 
        }
        if($scope.old.usuario.ds_login !== $scope.usuario.login){
            jsonUsuario.ds_login = $scope.usuario.login;
            alterouUsuario = true; 
        }
        if(($scope.old.usuario.id_grupo === null ^ $scope.usuario.grupoempresa.ds_nome === null) ||
            $scope.old.usuario.id_grupo !== $scope.usuario.grupoempresa.id_grupo){ 
            if(!$scope.usuario.grupoempresa.ds_nome) jsonUsuario.id_grupo = -1; // seta para null no banco
            else jsonUsuario.id_grupo = $scope.usuario.grupoempresa.id_grupo;
            alterouUsuario = true; 
        } 
        if(($scope.old.usuario.nu_cnpjEmpresa === null ^ $scope.usuario.empresa.ds_fantasia === null) ||
            $scope.old.usuario.nu_cnpjEmpresa !== $scope.usuario.empresa.nu_cnpj){ 
            if(!$scope.usuario.empresa.ds_fantasia) jsonUsuario.nu_cnpjEmpresa = ''; // seta para null no banco
            else jsonUsuario.nu_cnpjEmpresa = $scope.usuario.empresa.nu_cnpj;
            alterouUsuario = true; 
        }
        // ROLES DO USUÁRIO
        var r = [];
        if($scope.old.roles.length > 0){ 
            if($scope.old.roles[0].RoleId !== $scope.roleSelecionada.RoleId){
                r.push({RoleId : $scope.roleSelecionada.RoleId, RolePrincipal: true});  // adiciona a nova
                r.push({UserId: -1, RoleId : $scope.old.roles[0].RoleId, RolePrincipal : true}); // remove a anterior
            }
        }else r.push({RoleId : $scope.roleSelecionada.RoleId, RolePrincipal: true}); // adiciona a nova
        
        // VENDEDOR
        if(!$scope.ehComercial($scope.roleSelecionada)){
            // Perfil selecionado não é o comercial => Só pode existir desassociações de grupos empresas
            addidsgrupoempresavendedor = [];
            for(var k = 0; k < $scope.old.gruposempresasvendedor.length; k++)
                removeidsgrupoempresavendedor.push($scope.old.gruposempresasvendedor[k].id_grupo);
        }
        
        // Verifica se houve alterações
        if(!alterouPessoa && !alterouUsuario && r.length == 0 && 
            addidsgrupoempresavendedor.length == 0 && removeidsgrupoempresavendedor.length == 0){
            $scope.goAdministrativoUsuarios();
            return;
        }
        
        // JSON DE ENVIO
        var json = { };
        if(alterouPessoa) json.pessoa = jsonPessoa;
        json.webpagesusers = jsonUsuario;
        if(r.length > 0) json.webpagesusersinroles = r;
        if(addidsgrupoempresavendedor.length > 0) json.addidsgrupoempresavendedor = addidsgrupoempresavendedor;
        if(removeidsgrupoempresavendedor.length > 0) json.removeidsgrupoempresavendedor = removeidsgrupoempresavendedor;

        // Envia
        //console.log(json);
        //progressoCadastro(false);
        //$scope.hideProgress(divPortletBodyUsuarioCadPos);
        $webapi.update($apis.getUrl($apis.administracao.webpagesusers, undefined, {id: 'token', valor: $scope.token}), json)
            .then(function(dados){
                     progressoCadastro(false);
                     // Reseta os dados
                     resetaVariaveis();
                     // Hide progress
                     $scope.hideProgress(divPortletBodyUsuarioCadPos);
                     // Volta para a tela de Usuários
                      $scope.goAdministrativoUsuarios()
                     // Exibe a mensagem de sucesso
                     $timeout(function(){$scope.showAlert('Usuário alterado com sucesso!', true, 'success', true)}, 500);  
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar o usuário (' + failData.status + ')', true, 'danger', true);
                     progressoCadastro(false);
                     $scope.hideProgress(divPortletBodyUsuarioCadPos);
                  });
        
    };
     
                                                         
    /**
      * Armazena as informações
      */
    $scope.armazenaInformacoesDoUsuario = function(){
        if($scope.formCadastroUsuario.$valid && $scope.dataValida() && $scope.loginValido() && $scope.emailValido() && $scope.roleSelecionada){//$scope.temRoleSelecionada){
            if($scope.ehCadastro()) cadastraUsuario();
            else alteraUsuario();
        }else{
            // Verifica quais campos estão faltando/errados
            if($scope.formCadastroUsuario.pessoaNome.$invalid){
                $scope.showModalAlerta("Nome é um campo obrigatório!");
                $scope.setTabCadastro(1);    
            }/*else if($scope.formCadastroUsuario.pessoaDataNasc.$invalid || !$scope.dataValida()){
                $scope.showModalAlerta("Data de nascimento digitada é inválida! Formato: DD/MM/AAAA (DD: dia. MM : mês. AAAA: ano");
                $scope.setTabCadastro(1);
            }*/else if($scope.formCadastroUsuario.pessoaTelefone.$invalid){
                $scope.showModalAlerta("Número de telefone informado é inválido!");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroUsuario.pessoaRamal.$invalid){
                $scope.showModalAlerta("Número do ramal informado é inválido!");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroUsuario.usuarioLogin.$invalid || !$scope.loginValido()){
                $scope.showModalAlerta("Informe um login válido!");
                $scope.setTabCadastro(2);
            }else if($scope.formCadastroUsuario.usuarioEmail.$invalid || !$scope.emailValido()){
                $scope.showModalAlerta("Informe um e-mail válido!");
                $scope.setTabCadastro(2);
            }else if(!$scope.roleSelecionada){//$scope.temRoleSelecionada){
                $scope.showModalAlerta("Selecione um privilégio!");
                $scope.setTabCadastro(3);
            }else $scope.showModalAlerta("Por favor, verifique novamente se os dados preenchidos são válidos");
        }
    };
                                                         
                                                         
                                                         
    // Filtro
    /*$scope.selecionouEmpresa = function(){
        console.log($scope.usuario.empresa);   
    }; */                                                     
    $scope.selecionouGrupoEmpresa = function(mantemEmpresa){
        if(!mantemEmpresa) $scope.usuario.empresa = '';
        $scope.buscaEmpresas();    
    };
    /**
      * Busca Grupos empresas a partir do texto parcial
      */
    $scope.buscaGrupoEmpresas = function(texto, restrictList){
       $scope.pesquisandoGruposEmpresas = true;
       // Obtém a URL                                                      
       var url = $apis.getUrl($apis.cliente.grupoempresa, 
                                  [$scope.token, 0, /*$campos.cliente.grupoempresa.ds_nome*/ 101, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                                  {id:/*$campos.cliente.grupoempresa.ds_nome*/ 101, valor: texto + '%'});
       // Requisita e obtém os dados
       return $http.get(url).then(function(dados){
           var list = dados.data.Registros;
           // Verifica se tem uma lista para restringir a lista obtida via http get
           if(restrictList && angular.isArray(restrictList)){
               for(var k = 0; k < restrictList.length; k++){
                   var rl = restrictList[k];
                   // Busca o elemento da lista restrita na lista completa
                   var el = $filter('filter')(list, function(e){ return e.id_grupo === rl.id_grupo})[0];
                   if(el) list.splice(list.indexOf(el), 1); // Remove o elemento
               }       
           }
           $scope.pesquisandoGruposEmpresas = false;
           return list;
        },function(failData){
             if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
             else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
             else $scope.showAlert('Houve uma falha ao requisitar o filtro de empresas (' + failData.status + ')', true, 'danger', true);
             $scope.pesquisandoGruposEmpresas = false;
             return [];
          });
    };
    /**
      * Busca filiais a partir do grupo empresa selecionado
      */                                                     
    $scope.buscaEmpresas = function(){
       $scope.pesquisandoEmpresas = true;
       // filtro
       var filtro = [{id:/*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuario.grupoempresa.id_grupo}];
       // Somente com status ativo
       filtro.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});
       //if(texto) filtro = [filtro, {id:/*$campos.cliente.empresa.ds_fantasia*/ 104, valor: texto + '%'}];
       // Obtém a URL     
       var url = $apis.getUrl($apis.cliente.empresa, 
                                  [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],//, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                                  filtro);
       $scope.empresas = [];
       // Requisita e obtém os dados
       //return 
       $http.get(url).then(function(dados){
           $scope.pesquisandoEmpresas = false;
           $scope.empresas = dados.data.Registros;
           
           if($scope.usuario.empresa)
               $scope.usuario.empresa = $filter('filter')($scope.empresas, function(e){return e.nu_cnpj === $scope.usuario.empresa.nu_cnpj;})[0];
           //return dados.data.Registros;
        },function(failData){
             if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
             else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
             else $scope.showAlert('Houve uma falha ao requisitar o filtro de filiais (' + failData.status + ')', true, 'danger', true);
             $scope.pesquisandoEmpresas = false;
             //return [];
          });
    }; 
                                                         
                                                         
                                                         
    // TAB
    
    // Vai para a tab anterior
    $scope.setTabAnterior = function(){
        if($scope.tabCadastro > 1) $scope.setTabCadastro($scope.tabCadastro - 1);
    };
    // Vai para a próxima tab
    $scope.setProximaTab = function(){
        if($scope.tabCadastro < 4) $scope.setTabCadastro($scope.tabCadastro + 1);
    };
    // Modifica a tab atual
    $scope.setTabCadastro = function(tab) {
        $scope.tabCadastro = tab;
    };
    // Retorna true se a tab informada é a selecionada
    $scope.tabCadastroSelecionada = function(tab){
        return $scope.tabCadastro === tab;
    };
    
    // Validação dos campos
    // PESSOA
    $scope.dataValida = function(){
        return dataValida || !$scope.pessoa.data_nasc;    
    };
    $scope.validaData = function(){
        if($scope.pessoa.data_nasc){
            var parts = $scope.pessoa.data_nasc.split("/");
            var data = new Date(parts[2], parts[1] - 1, parts[0]);//Date.parse($scope.pessoa.data_nasc);
            // Verifica se a data é válida
            dataValida = parts[0] == data.getDate() && (parts[1] - 1) == data.getMonth() && parts[2] == data.getFullYear();
        }else dataValida = false;
    };
    // USUÁRIO
    $scope.emailValido = function(){
        return emailValido;    
    }
    $scope.loginValido = function(){
        return loginValido;    
    }
    //Valida e-mail
    $scope.validaEmail = function(){
        if($scope.usuario.email){
            if($scope.old.usuario !== null && 
               $scope.old.usuario.ds_email.toLowerCase() === $scope.usuario.email.toLowerCase()){ 
                // Não alterou o e-mail
                $('#labelEmailEmUso').hide();
                emailValido = true;
                $('#icon-email').hide(); // sem exibir o ícone
                return;
            }
            $scope.validandoEmail = true;
            $webapi.get($apis.getUrl($apis.administracao.webpagesusers, [$scope.token, 0], 
                                     {id:/*$campos.administracao.webpagesusers.ds_email*/ 102, 
                                      valor:$scope.usuario.email.toLowerCase()}))
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelEmailEmUso').show();
                                emailValido = false;
                                $('#icon-email').show();
                            }else{
                                $('#labelEmailEmUso').hide();
                                emailValido = true;
                                $('#icon-email').show();
                            }
                            $scope.atualizaProgressoDoCadastro();
                            $scope.validandoEmail = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR E-MAIL");
                            $scope.validandoEmail = false;
                        });
        }else{
            emailValido = false;  
            $scope.atualizaProgressoDoCadastro();
        }
    };
    //Valida login
    $scope.validaLogin = function(){
        if($scope.usuario.login){
            if($scope.old.usuario !== null && $scope.old.usuario.ds_login === $scope.usuario.login){ 
                // Não alterou o login
                $('#labelLoginEmUso').hide();
                loginValido = true;
                $('#icon-login').hide(); // sem exibir o ícone
                return;
            }
            $scope.validandoLogin = true;
            $webapi.get($apis.getUrl($apis.administracao.webpagesusers, [$scope.token, 0], 
                                     {id:/*$campos.administracao.webpagesusers.ds_login*/ 101, valor:$scope.usuario.login}))
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelLoginEmUso').show();
                                loginValido = false;
                                $('#icon-login').show();
                            }else{
                                $('#labelLoginEmUso').hide();
                                loginValido = true;
                                $('#icon-login').show();
                            }
                            $scope.atualizaProgressoDoCadastro();
                            $scope.validandoLogin = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR LOGIN");
                            $scope.validandoLogin = false;
                        });
        }else{
            loginValido = false;  
            $scope.atualizaProgressoDoCadastro();
        }
    };
    // ROLES
    $scope.handleRole = function(){
      // Obtém o array das roles que tem o campo 'selecionado' com valor true
      /*$scope.rolesSelecionadas = $filter('filter')($scope.roles, function(r){return r.selecionado === true;});
      if($scope.rolesSelecionadas.length > 0){
          // Remove as duplicatas
          $scope.rolesSelecionadas = $filter('unique')($scope.rolesSelecionadas, 'PaginaInicial');
          // Verifica se foi a primeira role a ser selecionada
          if($scope.rolesSelecionadas.length === 1) $scope.rolePrincipal = $scope.rolesSelecionadas[0];
          else if($filter('filter')($scope.rolesSelecionadas, $scope.rolePrincipal).length == 0){
             // Role previamente selecionada como principal não aparece na list (é uma página inicial duplicada!)
             $scope.rolePrincipal = $filter('filter')($scope.rolesSelecionadas, $scope.rolePrincipal.PaginaInicial)[0];
          }
          // Atualiza o flag
          $scope.temRoleSelecionada = true;
      }else{ 
          $scope.temRoleSelecionada = false;
          $scope.rolePrincipal = undefined;
      }*/
      // Atualiza o progresso do cadastro
      $scope.atualizaProgressoDoCadastro();
    };
    

                                                         
    // Progresso do cadastro
    // Form Pessoa                                                     
    var getPercentualFormPessoa = function(){
        var percentual = $scope.pessoa.nome ? 25 : 0; // nome => obrigatório
        if(percentual > 0){
            // Avalia se há conteúdo no input. Se tiver, tem que ser um conteúdo válido
            var conteudoData = '';
            var conteudoTelefone = '';
            var conteudoRamal = '';
            if($scope.formCadastroUsuario){
                conteudoData = $scope.pessoa.data_nasc /*!== null*/;//$scope.formCadastroUsuario.pessoaDataNasc.$viewValue;
                conteudoTelefone = $scope.formCadastroUsuario.pessoaTelefone.$viewValue;
                conteudoRamal = $scope.formCadastroUsuario.pessoaRamal.$viewValue;
            }
            percentual += !conteudoData || dataValida ? 25 : 0; // data
            percentual += !conteudoTelefone || $scope.pessoa.telefone ? 25 : 0; // telefone
            percentual += !conteudoRamal || $scope.pessoa.ramal ? 25 : 0; // ramal
        }else{
            percentual += dataValida ? 25 : 0; // data
            percentual += $scope.pessoa.telefone ? 25 : 0; // telefone
            percentual += $scope.pessoa.ramal ? 25 : 0; // ramal
        }
        return percentual;    
    };
    // Form Usuário                                                    
    var getPercentualFormUsuario = function(){
        var percentual = $scope.loginValido() ? 25 : 0; // login => obrigatório
        percentual += $scope.emailValido() ? 25 : 0; // e-mail => obrigatório
        if(percentual > 0){
            percentual += $scope.loginValido() ? 25 : 0; // tanto faz o cara ter ou não associado um grupo empresa
            percentual += $scope.emailValido() ? 25 : 0; // tanto faz o cara ter ou não associado uma empresa
        }else{
            percentual += $scope.usuario.empresa.ds_fantasia ? 25 : 0;
            percentual += $scope.usuario.grupoempresa.ds_nome ? 25 : 0;
        }
        return percentual;    
    };
    // Form Roles
    var getPercentualFormRoles = function(){
        return /*$scope.temRoleSelecionada*/ $scope.roleSelecionada ? 100 : 0 ; 
    };
    // Progresso                                                     
    $scope.atualizaProgressoDoCadastro = function(){
        // São obrigatórios: 1 campo para pessoa (nome), 2 campos obrigatórios para usuário (login e e-mail) e alguma role
        var progressoPessoa = getPercentualFormPessoa();
        var progressoUsuario = getPercentualFormUsuario();
        var progressoRoles = getPercentualFormRoles();
        // Atualiza
        var percent = (progressoPessoa + progressoUsuario + progressoRoles) / 3;
        $('#form_wizard_1').find('.progress-bar').css({
            width: percent + '%'
        });    
    };
                                                         
    
    // DATA DE NASCIMENTO
    /**
      * Exibe o calendario 
      */
    $scope.exibeCalendarioDataNasc = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataNasc = !$scope.abrirCalendarioDataNasc;
    }; 
    $scope.alterouDataNasc = function(){
        dataValida = true;
        $scope.atualizaProgressoDoCadastro();
        //console.log($scope.pessoa.data_nasc);
    };
    /**
      * Retorna a data em string
      */
    $scope.getDataDeNascimento = function(){
        /*console.log($scope.pessoa.data_nasc);
        if($scope.pessoa && $scope.pessoa.data_nasc !== null) 
            return $scope.pessoa.data_nasc.getDate() + '/' + ($scope.pessoa.data_nasc.getMonth() + 1) + '/' + $scope.pessoa.data_nasc.getFullYear();
        return '';*/
        return dataValida ? $scope.pessoa.data_nasc : '';
    };
                                                         
                                                         
                                                         
                                                         
    // VENDEDOR
    /**
      * Retorna true se a role é comercial
      */
    $scope.ehComercial = function(role){
        if(!role) return false;
        return role.RoleName.toUpperCase() === 'COMERCIAL';
    }
    /**
      * Retorna true se o modal de associação de grupos empresas com vendedor estiver sendo exibido
      */
    $scope.estaExibindoModalGrupoEmpresaVendedor = function(){
        return $('#modalGrupoEmpresaVendedor').hasClass('in');    
    };
    /**
      * Exibe o modal de associação de grupos empresas com vendedor
      */
    $scope.exibeModalGrupoEmpresaVendedor = function(){
        $scope.grupoempresavendedor.selecionado = $scope.gruposempresasvendedor[0];
        $('#modalGrupoEmpresaVendedor').modal('show'); 
    };
    /**
      * Fecha o modal de associação de grupos empresas com vendedor
      */
    $scope.fechaModalGrupoEmpresaVendedor = function(){
        $('#modalGrupoEmpresaVendedor').modal('hide'); 
    };                                                     
    /**
      * Associa o grupo empresa buscado ao vendedor
      */                                                     
    $scope.adicionaGrupoEmpresaVendedor = function(){
        $scope.gruposempresasvendedor.push($scope.grupoempresavendedor.busca);
        // Ordena
        $scope.gruposempresasvendedor = $filter('orderBy')($scope.gruposempresasvendedor, 'ds_nome');
        // Tem elemento selecionado?
        if(!$scope.grupoempresavendedor.selecionado) 
            $scope.grupoempresavendedor.selecionado = $scope.gruposempresasvendedor[0]; // Seleciona o primeiro 
        $scope.grupoempresavendedor.busca = '';
    };
    /**
      * Desassocia o grupo empresa buscado ao vendedor
      */                                                     
    $scope.desassociaGrupoEmpresaVendedor = function(){
        // Remove do array
        var index =  $scope.gruposempresasvendedor.indexOf($scope.grupoempresavendedor.selecionado);
        $scope.gruposempresasvendedor.splice(index,1);
        if(index < $scope.gruposempresasvendedor.length)
            $scope.grupoempresavendedor.selecionado = $scope.gruposempresasvendedor[index];  
        else $scope.grupoempresavendedor.selecionado = $scope.gruposempresasvendedor[index - 1];
    };
    /**
      * Retoma as associações previamente salvas no banco
      */                                                     
    $scope.resetaGrupoEmpresaVendedor = function(){
        angular.copy($scope.old.gruposempresasvendedor, $scope.gruposempresasvendedor); 
        addidsgrupoempresavendedor = [];
        removeidsgrupoempresavendedor = [];
    };
    /**
      * Armazena em memória as associações que devem ser criadas e desfeitas
      */                                                     
    $scope.salvaGrupoEmpresaVendedor = function(){
        // Progress
        $scope.showProgress();
        // Inicia com arrays vazios
        addidsgrupoempresavendedor = [];
        removeidsgrupoempresavendedor = [];
        // Novas associações
        for(var k = 0; k < $scope.gruposempresasvendedor.length; k++){    
            var gp = $scope.gruposempresasvendedor[k];
            var old = $filter('filter')($scope.old.gruposempresasvendedor, function(g){return g.id_grupo === gp.id_grupo;});
            // Nova associação
            if(old.length == 0) addidsgrupoempresavendedor.push(gp.id_grupo);
        }
        // Desassociações 
        for(var k = 0; k < $scope.old.gruposempresasvendedor.length; k++){
            var old = $scope.old.gruposempresasvendedor[k];
            if($filter('filter')($scope.gruposempresasvendedor, function(g){return g.id_grupo === old.id_grupo;}).length == 0)
                removeidsgrupoempresavendedor.push(old.id_grupo);
        }
        // Fecha o modal
        $scope.fechaModalGrupoEmpresaVendedor();
        // Remove o progress da tela
        $scope.hideProgress();
    };
                                                         
}]);