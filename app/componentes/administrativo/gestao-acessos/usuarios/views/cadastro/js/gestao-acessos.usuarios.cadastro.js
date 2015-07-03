/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-usuarios-cadastro", ['servicos']) 

.controller("administrativo-usuarios-cadastroCtrl", ['$scope',
                                                     '$state',
                                                     '$stateParams',
                                                     '$http',
                                                     '$campos',
                                                     '$webapi',
                                                     '$apis',
                                                     '$filter',
                                                     '$autenticacao', 
                                                     function($scope,$state,$stateParams,$http,$campos,
                                                              $webapi,$apis,$filter,$autenticacao){ 
    
    var divPortletBodyUsuarioCadPos = 0; // posição da div que vai receber o loading progress            
    var token = '';                                                    
    $scope.tela = {tipo:'Cadastro', acao:'Cadastrar'};
    // Tab
    $scope.tabCadastro = 1;
    // Dados
    $scope.old = {pessoa:null,usuario:null,roles:[]};
    $scope.pessoa = {id:0, nome:'', data_nasc:null, telefone:'', ramal:''};
    $scope.usuario = {login:'', email:'', grupoempresa:'', empresa:''};
    $scope.roles = [];  
    var rolesSelecionadas = []; 
    // Controle
    //var dadosAPI = undefined;
    // Flags
    $scope.abrirCalendarioDataNasc = false;
    var dataValida = false;
    var loginValido = false;
    var emailValido = false;
    $scope.validandoLogin = false;
    $scope.validandoEmail = false;
    $scope.obtendoRoles = false; 
    $scope.rolesSelecionadas = false;
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
        // Grupo empresa
        $scope.usuario.grupoempresa = $scope.old.usuario.grupoempresa;
        // Empresa
        $scope.usuario.empresa = $scope.old.usuario.empresa;
        
        // PESSOA
        $scope.pessoa.nome = $scope.old.pessoa.nm_pessoa;
        if($scope.old.pessoa.dt_nascimento !== null){ 
            dataValida = true;
            $scope.pessoa.data_nasc = new Date($scope.old.pessoa.dt_nascimento.substr(0, 4) + '/' + $scope.old.pessoa.dt_nascimento.substr(5, 2) + '/' + $scope.old.pessoa.dt_nascimento.substr(8, 2));
        }
        $scope.old.pessoa.dt_nascimento = $scope.pessoa.data_nasc; // deixa no mesmo formato
        if($scope.old.pessoa.nu_telefone !== null) $scope.pessoa.telefone = $scope.old.pessoa.nu_telefone;
        else $scope.old.pessoa.nu_telefone = $scope.pessoa.telefone; // deixa em string
        if($scope.old.pessoa.nu_ramal !== null) $scope.pessoa.ramal = $scope.old.pessoa.nu_ramal;
        else $scope.old.pessoa.nu_ramal = $scope.pessoa.ramal; // deixa em string
    };                                                   
    /**
      * Obtém todas as roles cadastradas
      */
    var obtemRoles = function(){
        $scope.obtendoRoles = true;  
        $webapi.get($apis.administracao.webpagesroles, [token, 0, $campos.administracao.webpagesroles.RoleName]) // ordenado pelo nome
            .then(function(dados){
                    $scope.obtendoRoles = false;
                    $scope.roles = dados.Registros;
                    // Atualiza informações
                    if($scope.old.usuario !== null){
                        for(var k = 0; k < $scope.old.roles.length; k++)
                            $filter('filter')($scope.roles, {RoleId:$scope.old.roles[k]})[0].selecionado = true;
                        $scope.handleRole();
                    }
                    $scope.hideProgress(divPortletBodyUsuarioCadPos);
                    $scope.atualizaProgressoDoCadastro(); // verificar datavalida
                  },
                  function(failData){
                     //console.log("FALHA AO OBTER ROLES: " + failData.status);
                     $scope.obtendoRoles = false;
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else $scope.showAlert('Houve uma falha ao requisitar informações (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyUsuarioCadPos); 
                     $scope.atualizaProgressoDoCadastro();
                  }); 
    };
    
    /**
      * Reseta as variáveis
      */
    var resetaVariaveis = function(){
        $scope.rolesSelecionadas = false;
        $scope.old = {pessoa:null,usuario:null,roles:[]};
        $scope.pessoa = {id:0, nome:'', data_nasc:null, telefone:'', ramal:''};
        $scope.usuario = {login:'', email:'', grupoempresa:'', empresa:''};    
    };
                                                         
    /**
      * Inicialização do controller
      */
    $scope.administrativoUsuariosCadastroInit = function(){
        // Obtem o token
        token = $autenticacao.getToken();
        // Exibe o alert de progress
        //$scope.showAlert('Carregando informações');
        $scope.showProgress(divPortletBodyUsuarioCadPos);
        // Verifica se tem parâmetros
        if($stateParams.usuario !== null){
            $scope.tela.tipo = 'Alteração'; 
            $scope.tela.acao = 'Alterar';
            $scope.old.usuario = $stateParams.usuario.webpagesusers;
            $scope.old.pessoa = $stateParams.usuario.pessoa;
            $scope.old.roles = $stateParams.usuario.webpagesusersinroles;
            //console.log($stateParams.usuario);
            // Atualiza demais dados
            atualizaDadosDoUsuario();
            // Grupo Empresa
            $scope.usuario.grupoempresa = {id_grupo: $scope.old.usuario.id_grupo, 
                                           ds_nome: $stateParams.usuario.grupoempresa};
            // Empresa
            $scope.usuario.empresa = {nu_cnpj: $scope.old.usuario.nu_cnpjEmpresa, 
                                      ds_fantasia: $stateParams.usuario.empresa};
        } 
        // Obtém Roles
        obtemRoles(); 
        // Título da página
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = $scope.tela.tipo + ' de Usuário';
        $scope.setTabCadastro(1);
        // Quando houver uma mudança de rota => Avalia se tem informações preenchidas e 
        // solicita confirmação de descarte das mesmas. Se confirmado => muda estado                                              
        $scope.$on('mudancaDeRota', function(event, state, params){
            // Obtem o JSON de mudança
            var jsonMudanca = {state: state, params : params};            
            // Verifica se possui dados preenchidos
            if($scope.ehCadastro()){
                if($scope.pessoa.nome || $scope.pessoa.data_nasc !== null || $scope.pessoa.telefone || $scope.pessoa.ramal || 
                   $scope.usuario.email || $scope.usuario.empresa || $scope.usuario.grupoempresa || $scope.usuario.login ||
                   $scope.rolesSelecionadas){
                    // Exibe um modal de confirmação
                    $scope.showModal('Confirmação', 
                         'Tem certeza que deseja descartar as informações preenchidas?',
                         mudaEstado, {state: state, params : params},
                         'Sim', 'Não');
                }else $state.go(state, params);
            }else{
               // Verifica se teve alterações
               if(!houveAlteracoes()) $state.go(state, params); // não houve alterações  
               else{ 
                   // Houve alterações!
                   $scope.showModal('Confirmação', 
                         'Tem certeza que deseja descartar as informações alteradas?',
                         mudaEstado, {state: state, params : params},
                         'Sim', 'Não');
               }
            }
        });
        
        /*($scope.$on("$destroy", function(event) {
                // Cancela uma possível requisição em andamento
                dadosAPI.cancel();
            }
        );*/
    };
    /**
      * Altera o estado, enviado pelo json => usado no modal de confirmação
      */
    var mudaEstado = function(json){
       $state.go(json.state, json.params); 
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
        // Cadastra
        progressoCadastro(true)
        //postPessoa();
        //* PESSOA
        var jsonPessoa = {};
        // Obrigatório
        jsonPessoa.nm_pessoa = $scope.pessoa.nome;
        // Não-Obrigatórios
        if($scope.pessoa.data_nasc !== null){ 
            //var dt = $scope.pessoa.data_nasc.split('/');
            //jsonPessoa.dt_nascimento = $filter('date')(new Date(dt[2], dt[1] - 1, dt[0], 1, 0, 0, 0), "yyyy-MM-dd HH:mm:ss");
            jsonPessoa.dt_nascimento = $filter('date')(new Date($scope.pessoa.data_nasc), "yyyy-MM-dd HH:mm:ss");
        }
        if($scope.pessoa.telefone) jsonPessoa.nu_telefone = $scope.pessoa.telefone;
        if($scope.pessoa.ramal) jsonPessoa.nu_ramal = $scope.pessoa.ramal;
        // USUÁRIO
        var jsonUsuario = {};
        // Obrigatórios
        jsonUsuario.ds_login = $scope.usuario.login;
        jsonUsuario.ds_email = $scope.usuario.email;
        // Não-Obrigatórios
        if($scope.usuario.grupoempresa.ds_nome) jsonUsuario.id_grupo = $scope.usuario.grupoempresa.id_grupo;
        if($scope.usuario.empresa.ds_fantasia) jsonUsuario.nu_cnpjEmpresa = $scope.usuario.empresa.nu_cnpj;
        // ROLES DO USUÁRIO
        var r = [];
        for(var k in rolesSelecionadas) r.push({RoleId : rolesSelecionadas[k].RoleId});
        // JSON DE ENVIO
        var json = { 
                "pessoa" : jsonPessoa,
                "webpagesusers" : jsonUsuario,
                "webpagesusersinroles" : r
            };
        // Envia
        //$webapi.post($apis.administracao.pessoa, token, jsonPessoa)
        $.post($apis.administracao.webpagesusers + '?token=' + token, json)
                //.then(function(id_pessoa){
                .done(function(dados){
                    progressoCadastro(false);
                    $scope.showAlert('Usuário cadastrado com sucesso!', true, 'success', true);
                    // Reseta os dados
                    resetaVariaveis();
                    // Volta para a tela de Usuários
                    $scope.goAdministrativoUsuarios();
                  }//,function(failData){
                  ).fail(function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao cadastrar o usuário (' + failData.status + ')', true, 'danger', true);
                     progressoCadastro(false);
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
           console.log("HOUVE ALTERAÇÃO - PESSOA - DATA NASC"); 
           return true; 
        }
        if($scope.old.pessoa.nu_telefone !== $scope.pessoa.telefone){
           //console.log("HOUVE ALTERAÇÃO - PESSOA - TELEFONE"); 
           return true;    
        }
        if($scope.old.pessoa.nu_ramal !== $scope.pessoa.ramal){
            console.log("HOUVE ALTERAÇÃO - PESSOA - RAMAL"); 
            return true;
        }
           // USUÁRIO
        if($scope.old.usuario.ds_email !== $scope.usuario.email){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - EMAIL"); 
           return true; 
        }
        if($scope.old.usuario.ds_login !== $scope.usuario.login){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - LOGIN"); 
           return true; 
        } 
        if(($scope.old.usuario.id_grupo === null ^ $scope.usuario.grupoempresa.ds_nome === null) ||
            $scope.old.usuario.id_grupo !== $scope.usuario.grupoempresa.id_grupo){
           //console.log("HOUVE ALTERAÇÃO - USUÁRIO - GRUPO EMPRESA"); 
           return true; 
        } 
        if(($scope.old.usuario.nu_cnpjEmpresa === null ^ $scope.usuario.empresa.ds_fantasia === null) ||
            $scope.old.usuario.nu_cnpjEmpresa !== $scope.usuario.empresa.nu_cnpj){ 
            //console.log("HOUVE ALTERAÇÃO - USUÁRIO - EMPRESA"); 
            return true;
        }
        // ROLES
        if(rolesSelecionadas.length !== $scope.old.roles.length){ 
            //console.log("HOUVE ALTERAÇÃO - ROLE - LENGTH");
            return true;
        }
        for(var k = 0; k < $scope.old.roles.length; k++){
           if($filter('filter')(rolesSelecionadas, {RoleId:$scope.old.roles[k]}).length == 0){ 
               console.log("HOUVE ALTERAÇÃO - ROLE");
               return true; 
           }
        }
        return false;
    }; 
    /**
      * Altera as informações do usuário
      */                                                     
    var alteraUsuario = function(){
        
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
            //var dt = $scope.pessoa.data_nasc.split('/');
            //jsonPessoa.dt_nascimento = $filter('date')(new Date(dt[2], dt[1] - 1, dt[0], 1, 0, 0, 0), "yyyy-MM-dd HH:mm:ss");
            jsonPessoa.dt_nascimento = $filter('date')(new Date($scope.pessoa.data_nasc), "yyyy-MM-dd HH:mm:ss");
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
        
        var jsonUsuario = {id_users : $scope.old.usuario.id_users};
        var alterouUsuario = false;        
        if($scope.old.usuario.ds_email !== $scope.usuario.email){
            jsonUsuario.ds_email = $scope.usuario.email; 
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
        // Novas roles
        for(var k in rolesSelecionadas){ 
            if($filter('filter')($scope.old.roles, rolesSelecionadas[k].RoleId).length == 0) 
                r.push({RoleId : rolesSelecionadas[k].RoleId});
        }
        // Roles a serem desassociadas do usuário 
        for(var k = 0; k < $scope.old.roles.length; k++){
           if($filter('filter')(rolesSelecionadas, {RoleId:$scope.old.roles[k]}).length == 0)
               r.push({UserId: -1, RoleId : $scope.old.roles[k]});
        }
        
        // Verifica se houve alterações
        if(!alterouPessoa && !alterouUsuario && r.length == 0){
            $scope.goAdministrativoUsuarios();
            return;
        }
        
        // JSON DE ENVIO
        var json = { };
        if(alterouPessoa) json.pessoa = jsonPessoa;
        json.webpagesusers = jsonUsuario;
        if(r.length > 0) json.webpagesusersinroles = r;
        // Envia
        $webapi.update($apis.administracao.webpagesusers, {id: 'token', valor: token}, json)
            .then(function(dados){
                     progressoCadastro(false);
                     $scope.showAlert('Usuário alterado com sucesso!', true, 'success', true);
                     // Reseta os dados
                     resetaVariaveis();
                     // Hide progress
                     $scope.hideProgress(divPortletBodyUsuarioCadPos);
                     // Volta para a tela de Usuários
                     $scope.goAdministrativoUsuarios();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao alterar o usuário (' + failData.status + ')', true, 'danger', true);
                     progressoCadastro(false);
                     $scope.hideProgress(divPortletBodyUsuarioCadPos);
                  }); 
        
    };
     
                                                         
    /**
      * Armazena as informações
      */
    $scope.armazenaInformacoesDoUsuario = function(){
        if($scope.formCadastroUsuario.$valid && $scope.dataValida() && $scope.loginValido() && $scope.emailValido() && $scope.rolesSelecionadas) {
            if($scope.ehCadastro()) cadastraUsuario();
            else alteraUsuario();
        }else{
            // Verifica quais campos estão faltando/errados
            if($scope.formCadastroUsuario.pessoaNome.$invalid){
                alert("Nome é um campo obrigatório!");
                $scope.setTabCadastro(1);    
            }/*else if($scope.formCadastroUsuario.pessoaDataNasc.$invalid || !$scope.dataValida()){
                alert("Data de nascimento digitada é inválida! Formato: DD/MM/AAAA (DD: dia. MM : mês. AAAA: ano");
                $scope.setTabCadastro(1);
            }*/else if($scope.formCadastroUsuario.pessoaTelefone.$invalid){
                alert("Número de telefone informado é inválido!");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroUsuario.pessoaRamal.$invalid){
                alert("Número do ramal informado é inválido!");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroUsuario.usuarioLogin.$invalid || !$scope.loginValido()){
                alert("Informe um login válido!");
                $scope.setTabCadastro(2);
            }else if($scope.formCadastroUsuario.usuarioEmail.$invalid || !$scope.emailValido()){
                alert("Informe um e-mail válido!");
                $scope.setTabCadastro(2);
            }else if(!$scope.rolesSelecionadas){
                alert("Selecione pelo menos um privilégio!");
                $scope.setTabCadastro(3);
            }else alert("Por favor, verifique novamente se os dados preenchidos são válidos");
        }
    };
                                                         
                                                         
                                                         
    // Filtro
    $scope.buscaGrupoEmpresas = function(texto){
       $scope.pesquisandoGruposEmpresas = true;
       // Obtém a URL                                                      
       var url = $webapi.getUrl($apis.cliente.grupoempresa, 
                                  [token, 0, $campos.cliente.grupoempresa.ds_nome, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                                  {id:$campos.cliente.grupoempresa.ds_nome, valor: '%' + texto + '%'});
       // Requisita e obtém os dados
       return $http.get(url).then(function(dados){
           $scope.pesquisandoGruposEmpresas = false;
           return dados.data.Registros;
        },function(failData){
             //console.log("FALHA AO OBTER GRUPO EMPRESAS FILTRADOS: " + failData.status);
             if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
             else $scope.showAlert('Houve uma falha ao requisitar o filtro de empresas (' + failData.status + ')', true, 'danger', true);
             $scope.pesquisandoGruposEmpresas = false;
             return [];
          });
    };
    $scope.buscaEmpresas = function(texto){
       $scope.pesquisandoEmpresas = true;
       // Obtém a URL                                                      
       var url = $webapi.getUrl($apis.cliente.empresa, 
                                  [token, 0, $campos.cliente.empresa.ds_fantasia, 0, 10, 1], // ordenado crescente com 10 itens no máximo
                                  {id:$campos.cliente.empresa.ds_fantasia, valor: '%' + texto + '%'});
       // Requisita e obtém os dados
       return $http.get(url).then(function(dados){
           $scope.pesquisandoEmpresas = false;
           return dados.data.Registros;
        },function(failData){
             if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
             else $scope.showAlert('Houve uma falha ao requisitar o filtro de filiais (' + failData.status + ')', true, 'danger', true);
             $scope.pesquisandoEmpresas = false;
             return [];
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
            if($scope.old.usuario !== null && $scope.old.usuario.ds_email === $scope.usuario.email){ 
                // Não alterou o e-mail
                $('#labelEmailEmUso').hide();
                emailValido = true;
                $('#icon-email').hide(); // sem exibir o ícone
                return;
            }
            $scope.validandoEmail = true;
            $webapi.get($apis.administracao.webpagesusers, [token, 0], {id:$campos.administracao.webpagesusers.ds_email, valor:$scope.usuario.email})
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
            $webapi.get($apis.administracao.webpagesusers, [token, 0], {id:$campos.administracao.webpagesusers.ds_login, valor:$scope.usuario.login})
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
      rolesSelecionadas = $filter('filter')($scope.roles, {selecionado:true});
      $scope.rolesSelecionadas = rolesSelecionadas.length > 0;
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
                conteudoData = $scope.pessoa.data_nasc !== null;//$scope.formCadastroUsuario.pessoaDataNasc.$viewValue;
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
        return $scope.rolesSelecionadas ? 100 : 0 ; 
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
        //console.log($scope.pessoa.data_nasc);
        if($scope.pessoa && $scope.pessoa.data_nasc !== null) 
            return $scope.pessoa.data_nasc.getDate() + '/' + ($scope.pessoa.data_nasc.getMonth() + 1) + '/' + $scope.pessoa.data_nasc.getFullYear();
        return '';
    };
    
}]);