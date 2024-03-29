/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.1 - 24/02/2016
 *  - Alteração do CNPJ
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-filiais-cadastro", []) 

.controller("administrativo-filiais-cadastroCtrl", ['$scope',
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
    
    var divPortletBodyFilialCadPos = 0; // posição da div que vai receber o loading progress
    $scope.temPermissao = false;  // indica se tem permissão para acessar esta página                            
    $scope.tela = {tipo:'Cadastro', acao:'Cadastrar'};
    // Tab
    $scope.tabCadastro = 1;
    // Dados
    $scope.old = null;
    $scope.filial = { nu_cnpj: '',
                      ds_fantasia: '',
                      ds_razaoSocial: '',
                      ds_endereco: '',
                      ds_cidade: '',
                      sg_uf: '',
                      nu_cep: '',
                      nu_telefone: '',
                      ds_bairro: '',
                      ds_email: '',
                      filial: '',
                      nu_inscEstadual: ''
                    }; 
    // Flags
    var cnpjValido = false;
    var nomeFantasiaValido = false;                                                     
    $scope.validandoCNPJ = false;                                                       
    $scope.validandoNomeFantasia = false;
                                                         
    
    // Atualiza info a partir dos params                                                     
    var atualizaDadosDaFilial = function(){
        cnpjValido = nomeFantasiaValido = true;
        // Obrigatórios
        $scope.filial.nu_cnpj = $scope.old.nu_cnpj;
        $scope.filial.ds_fantasia = $scope.old.ds_fantasia;
        $scope.filial.ds_email = $scope.old.ds_email;
        // Não obrigatórios
        if($scope.old.ds_razaoSocial !== null) $scope.filial.ds_razaoSocial = $scope.old.ds_razaoSocial;
        if($scope.old.filial !== null) $scope.filial.filial = $scope.old.filial;
        if($scope.old.nu_inscEstadual !== null) $scope.filial.nu_inscEstadual = $scope.old.nu_inscEstadual;
        if($scope.old.nu_cep !== null) $scope.filial.nu_cep = $scope.old.nu_cep;
        if($scope.old.ds_endereco !== null) $scope.filial.ds_endereco = $scope.old.ds_endereco;
        if($scope.old.ds_bairro !== null) $scope.filial.ds_bairro = $scope.old.ds_bairro;
        if($scope.old.ds_cidade !== null) $scope.filial.ds_cidade = $scope.old.ds_cidade;
        if($scope.old.sg_uf !== null) $scope.filial.sg_uf = $scope.old.sg_uf;
        if($scope.old.nu_telefone !== null) $scope.filial.nu_telefone = $scope.old.nu_telefone;
    };
                                                         
                                                      
    /**
      * Inicialização do controller
      */
    $scope.administrativoFiliaisCadastroInit = function(){
        
        $scope.$on('mudancaDeRota', function(event, state, params){
            // Obtem o JSON de mudança
            var jsonMudanca = {state: state, params : params};            
            // Verifica se possui dados preenchidos
            if($scope.ehCadastro()){
                if($scope.filial.nu_cnpj || $scope.filial.ds_fantasia || $scope.filial.ds_razaoSocial ||
                   $scope.filial.filial || $scope.filial.nu_inscEstadual || $scope.filial.nu_cep ||
                   $scope.filial.ds_endereco || $scope.filial.ds_bairro || $scope.filial.ds_cidade ||
                   $scope.filial.sg_uf || $scope.filial.ds_email || $scope.filial.nu_telefone){
                    // Exibe um modal de confirmação
                    $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja descartar as informações preenchidas?',
                         mudaEstado, {state: state, params : params},
                         'Sim', 'Não');
                }else $state.go(state, params);
            }else{
               // Verifica se teve alterações
               if(!houveAlteracoes()) 
                    $state.go(state, params); // não houve alterações  
               else{ 
                   // Houve alterações!
                   $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja descartar as informações alteradas?',
                         mudaEstado, {state: state, params : params},
                         'Sim', 'Não');
               }
            }
        });
        
        // Verifica se tem grupo empresa
        if(!$scope.usuariologado.grupoempresa){
            // Sem grupo empresa não pode acessar esta tela!
            $scope.goAdministrativoFiliais();
            return;
        }
        
        $scope.$on('alterouGrupoEmpresa', function(event){
            // Modifica a visibilidade do campo de busca para o grupo empresa
            $scope.atualizaProgressoDoCadastro();
        }); 
        
        if(!$scope.methodsDoControllerCorrente){// || $scope.methodsDoControllerCorrente.length == 0){
            // Sem permissão nenhuma ?
            $scope.goUsuarioSemPrivilegios();
            return;
        }
        // Verifica se tem parâmetros
        if($stateParams.filial !== null){
            // Verifica se tem permissão para alterar
            if(!$scope.methodsDoControllerCorrente['atualização']){//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length == 0){
               // Não pode alterar
                $scope.goUsuarioSemPrivilegios();
                return;  
            }
            $scope.tela.tipo = 'Alteração'; 
            $scope.tela.acao = 'Alterar';
            $scope.old = $stateParams.filial;
            // atualiza info
            atualizaDadosDaFilial();
        }else // Verifica se tem permissão para cadastrar
            if(!$scope.methodsDoControllerCorrente['cadastro']){//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length == 0){
            // Não pode cadastrar
            $scope.goUsuarioSemPrivilegios();
            return;  
        }
        $scope.temPermissao = true; 
        // Título da página
        $scope.pagina.titulo = 'Gestão de Empresas';                          
        $scope.pagina.subtitulo = $scope.tela.tipo + ' de Filial';
                                                  
        $scope.atualizaProgressoDoCadastro();
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
        return $scope.old === null;    
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
                                                         
                                                         
                                                         
    // CNPJ
    $scope.cnpjValido = function(){
        return cnpjValido;    
    }                                                     
    // Valida CNPJ
    $scope.validaCNPJ = function(){
        if($scope.filial.nu_cnpj && $scope.filial.nu_cnpj.length == 14){
            if($scope.old !== null && $scope.old.nu_cnpj === $scope.filial.nu_cnpj){ 
                // Não alterou o cnpj
                $('#labelCNPJEmUso').hide();
                cnpjValido = true;
                $('#icon-cnpj').hide(); // sem exibir o ícone
                return;
            }
            $scope.validandoCNPJ = true;
            
            var filtro = [{id:/*$campos.cliente.empresa.nu_cnpj*/ 100, valor:$scope.filial.nu_cnpj}];
            // O CNPJ é validada em relação a toda as filiais de todos os grupos, não só do grupo associado
            //if($scope.usuariologado.grupoempresa) filtro.push({id:/*$campos.cliente.empresa.id_grupo*/ 116, 
            //                                     valor:$scope.usuariologado.grupoempresa.id_grupo});
            

            $webapi.get($apis.getUrl($apis.cliente.empresa, [$scope.token, 0], filtro))
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelCNPJEmUso').show();
                                cnpjValido = false;
                                $('#icon-cnpj').show();
                            }else{
                                $('#labelCNPJEmUso').hide();
                                cnpjValido = true;
                                $('#icon-cnpj').show();
                            }
                            $scope.atualizaProgressoDoCadastro();
                            $scope.validandoCNPJ = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR CNPJ");
                            $scope.validandoCNPJ = false;
                        });
        }else{
            cnpjValido = false;  
            $scope.atualizaProgressoDoCadastro();
        }
    }; 
                                                         
                                                         
    // NOME FANTASIA
    $scope.nomeFantasiaValido = function(){
        return nomeFantasiaValido;    
    };
    // Valida nome fantasia
    $scope.validaNomeFantasia = function(){
        //console.log("FANTASIA '" + $scope.filial.ds_fantasia + "'");
        if($scope.filial.ds_fantasia && $scope.filial.ds_fantasia.length > 0){
            //console.log("FANTASIA '" + $scope.filial.ds_fantasia + "'");
            if($scope.old !== null && $scope.old.ds_fantasia.toUpperCase() === $scope.filial.ds_fantasia.toUpperCase()){ 
                // Não alterou o login
                $('#labelNomeFantasiaEmUso').hide();
                nomeFantasiaValido = true;
                $('#icon-nome-fantasia').hide(); // sem exibir o ícone
                return;
            }
            
            $scope.validandoNomeFantasia = true;
            
            var filtro = [{id:/*$campos.cliente.empresa.ds_fantasia*/ 104, valor:$scope.filial.ds_fantasia}];
            // Nome fantasia é validadao apenas no domínio do grupo associado
            // Isto é, podem existir nomes fantasia iguais, porém de filiais associadas a grupos distintos
            if($scope.usuariologado.grupoempresa) filtro.push({id:/*$campos.cliente.empresa.id_grupo*/ 116, 
                                                 valor:$scope.usuariologado.grupoempresa.id_grupo});
                
            $webapi.get($apis.getUrl($apis.cliente.empresa, [$scope.token, 0], filtro))
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length > 0){ 
                                $('#labelNomeFantasiaEmUso').show();
                                nomeFantasiaValido = false;
                                $('#icon-nome-fantasia').show();
                            }else{
                                $('#labelNomeFantasiaEmUso').hide();
                                nomeFantasiaValido = true;
                                $('#icon-nome-fantasia').show();
                            }
                            $scope.atualizaProgressoDoCadastro();
                            $scope.validandoNomeFantasia = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR NOME FANTASIA");
                            $scope.validandoNomeFantasia = false;
                        });
        }else{
            nomeFantasiaValido = false;  
            $scope.atualizaProgressoDoCadastro();
        }
    };  
                                                         
                                                         
    
    // CEP
    $scope.consultaCEP = function(){
        if($scope.filial.nu_cep && $scope.filial.nu_cep.length === 8){
            $scope.showProgress(divPortletBodyFilialCadPos);
            $webapi.get('http://viacep.com.br/ws/' + $scope.filial.nu_cep + '/json/')
                // Verifica se a requisição foi respondida com sucesso
                    .then(function(dados){
                            if(dados.erro) $scope.showAlert('CEP inválido!', true, 'danger', true);
                            else {
                                $scope.filial.ds_endereco = dados.logradouro + ' ' + dados.complemento;
                                $scope.filial.ds_bairro = dados.bairro;
                                $scope.filial.ds_cidade = dados.localidade;
                                $scope.filial.sg_uf = dados.uf;
                            }
                            $scope.hideProgress(divPortletBodyFilialCadPos);
                        },
                        function(failData){
                            if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                            else $scope.showAlert('Houve uma falha ao consultar o CEP (' + failData.status + ')', true, 'danger', true);
                            $scope.hideProgress(divPortletBodyFilialCadPos);
                        });
        }else $scope.showModalAlerta('CEP deve conter 8 dígitos!');    
        
    };
                                                         
                                                         
                                                         
                                                         
    // Progresso  
    // Form Filial                                                    
    var getPercentualFormFilial = function(){
        var percentual = $scope.usuariologado.grupoempresa ? 50 : 0;
        percentual += $scope.cnpjValido() ? 25 : 0; 
        percentual += $scope.nomeFantasiaValido() ? 25 : 0;
        return percentual;    
    };
    // Form Contato                                                   
    var getPercentualFormContato = function(){
        var percentual = $scope.filial.ds_email ? 100 : 0;
        return percentual;    
    };                                                       
    $scope.atualizaProgressoDoCadastro = function(){
        var progressoFilial = getPercentualFormFilial();
        var progressoContato = getPercentualFormContato();
        // Atualiza
        var percent = (progressoFilial + progressoContato) / 2;
        $('#form_wizard_1').find('.progress-bar').css({
            width: percent + '%'
        });    
    };
                                                         
                                                         
                                                         
    // ARMAZENAMENTO
    /**
      * Reseta as variáveis
      */
    var resetaVariaveis = function(){
        $scope.old = null;
        $scope.filial = { nu_cnpj: '', ds_fantasia: '', ds_razaoSocial: '',
                          ds_endereco: '', ds_cidade: '', sg_uf: '',
                          nu_cep: '', nu_telefone: '', ds_bairro: '',
                          ds_email: '', filial: '', nu_inscEstadual: ''
                        };   
    };                                                     
    /**
      * Armazena as informações
      */
    $scope.armazenaInformacoesDaFilial = function(){
        if($scope.usuariologado.grupoempresa && $scope.formCadastroFilial.$valid && $scope.cnpjValido() && 
           $scope.nomeFantasiaValido()){
            if($scope.ehCadastro()) cadastraFilial();
            else alteraFilial();
        }else{
            if(!$scope.usuariologado.grupoempresa){
                $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            }else
            // Verifica quais campos estão faltando/errados
            if($scope.formCadastroFilial.filialEmpresa.$invalid || !$scope.nomeFantasiaValido()){
                $scope.showModalAlerta("Nome fantasia é inválido!");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroFilial.filialCnpj.$invalid || !$scope.cnpjValido()){
                $scope.showModalAlerta("CNPJ é inválido!");
                $scope.setTabCadastro(1);
            }else if($scope.formCadastroFilial.filialCep.$invalid){
                $scope.showModalAlerta("CEP é inválido!");
                $scope.setTabCadastro(2);
            }else if($scope.formCadastroFilial.filialEmail.$invalid){
                $scope.showModalAlerta("E-mail inválido!");
                $scope.setTabCadastro(3);
            }else $scope.showModalAlerta("Por favor, verifique novamente se os dados preenchidos são válidos");
        }
    }; 
                                                         
                                                         
   // CADASTRO
   var cadastraFilial = function(){
        // Não faz nada se tiver validando campos
        if($scope.validandoCNPJ || $scope.validandoNomeFantasia) return;
       
        // Cadastra
        $scope.showProgress(divPortletBodyFilialCadPos);
        // Obrigatórios
        var jsonFilial = { nu_cnpj: $scope.filial.nu_cnpj,
                           ds_fantasia: $scope.filial.ds_fantasia,
                           ds_email: $scope.filial.ds_email.toLowerCase(),
                           id_grupo: $scope.usuariologado.grupoempresa.id_grupo
                         };
        // Não obrigatórios
        if($scope.filial.ds_razaoSocial) jsonFilial.ds_razaoSocial = $scope.filial.ds_razaoSocial;
        if($scope.filial.filial) jsonFilial.filial = $scope.filial.filial;
        if($scope.filial.nu_inscEstadual) jsonFilial.nu_inscEstadual = $scope.filial.nu_inscEstadual;
        if($scope.filial.nu_cep) jsonFilial.nu_cep = $scope.filial.nu_cep;
        if($scope.filial.ds_endereco) jsonFilial.ds_endereco = $scope.filial.ds_endereco;
        if($scope.filial.ds_bairro) jsonFilial.ds_bairro = $scope.filial.ds_bairro;
        if($scope.filial.ds_cidade) jsonFilial.ds_cidade = $scope.filial.ds_cidade;
        if($scope.filial.sg_uf) jsonFilial.sg_uf = $scope.filial.sg_uf;
        if($scope.filial.nu_telefone) jsonFilial.nu_telefone = $scope.filial.nu_telefone;

        // Envia
        //console.log(jsonFilial);
        $webapi.post($apis.getUrl($apis.cliente.empresa, undefined,
                                  {id: 'token', valor: $scope.token}), jsonFilial)
                .then(function(dados){
                    // Reseta os dados
                    resetaVariaveis();
                    // Hide progress
                    $scope.hideProgress(divPortletBodyFilialCadPos);
                    // Volta para a tela de Usuários
                    $scope.goAdministrativoFiliais();
                    // Exibe a mensagem de sucesso
                    $timeout(function(){$scope.showAlert('Filial cadastrada com sucesso!', true, 'success', true)}, 500);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao cadastrar a filial (' + failData.status + ')', true, 'danger', true);
                     // Hide progress
                     $scope.hideProgress(divPortletBodyFilialCadPos);
                  }); 
   };
   
                                                         
   // ALTERAÇÃO  
   /**
      * Retorna true se houve alterações no formulário
      */
    var houveAlteracoes = function(){
        if($scope.old === null) return false;
        if($scope.filial.nu_cnpj !== $scope.old.nu_cnpj) 
            return true;
        if($scope.filial.ds_fantasia !== $scope.old.ds_fantasia) 
            return true;
        if($scope.filial.ds_email.toLowerCase() !== $scope.old.ds_email.toLowerCase()) 
            return true;
        if($scope.filial.ds_razaoSocial !== $scope.old.ds_razaoSocial) 
            return true;
        if($scope.filial.filial !== $scope.old.filial) 
            return true;
        if($scope.filial.nu_inscEstadual !== $scope.old.nu_inscEstadual) 
            return true;
        if($scope.filial.nu_cep !== $scope.old.nu_cep) 
            return true;
        if($scope.filial.ds_endereco !== $scope.old.ds_endereco) 
            return true;
        if($scope.filial.ds_bairro !== $scope.old.ds_bairro) 
            return true;
        if($scope.filial.ds_cidade !== $scope.old.ds_cidade) 
            return true;
        if($scope.filial.sg_uf !== $scope.old.sg_uf) 
            return true;
        if($scope.filial.nu_telefone !== $scope.old.nu_telefone) 
            return true;
        return false;
    };                                                       
                                                         
   /**
     * Envia o json com as alterações
     */
   var alteraFilial = function(){
       
       // Não faz nada se tiver validando campos
       if($scope.validandoCNPJ || $scope.validandoNomeFantasia) return;
       
       if($scope.old === null){ 
            console.log("NÃO HÁ DADOS ANTERIORES!");
            return;
       }
       
       // Houve alterações?
       if(!houveAlteracoes()){
            $scope.goAdministrativoFiliais();
            return;    
       }
       
        // Obrigatórios
        var jsonFilial = { novo_cnpj : $scope.filial.nu_cnpj,
                           nu_cnpj: $scope.old.nu_cnpj,
                           id_grupo: $scope.usuariologado.grupoempresa.id_grupo,
                           fl_ativo : $scope.old.fl_ativo
                         };
       
        // Só envia no json os dados que de fato alteraram
        $scope.showProgress(divPortletBodyFilialCadPos);
        
        if($scope.filial.ds_fantasia !== $scope.old.ds_fantasia) 
            jsonFilial.ds_fantasia = $scope.filial.ds_fantasia;
        if($scope.filial.ds_email.toLowerCase() !== $scope.old.ds_email.toLowerCase()) 
            jsonFilial.ds_email = $scope.filial.ds_email.toLowerCase();
        if($scope.filial.ds_razaoSocial !== $scope.old.ds_razaoSocial) 
            jsonFilial.ds_razaoSocial = $scope.filial.ds_razaoSocial;
        if($scope.filial.filial !== $scope.old.filial) 
            jsonFilial.filial = $scope.filial.filial;
        if($scope.filial.nu_inscEstadual !== $scope.old.nu_inscEstadual) 
            jsonFilial.nu_inscEstadual = $scope.filial.nu_inscEstadual;
        if($scope.filial.nu_cep !== $scope.old.nu_cep) 
            jsonFilial.nu_cep = $scope.filial.nu_cep;
        if($scope.filial.ds_endereco !== $scope.old.ds_endereco) 
            jsonFilial.ds_endereco = $scope.filial.ds_endereco;
        if($scope.filial.ds_bairro !== $scope.old.ds_bairro) 
            jsonFilial.ds_bairro = $scope.filial.ds_bairro;
        if($scope.filial.ds_cidade !== $scope.old.ds_cidade) 
            jsonFilial.ds_cidade = $scope.filial.ds_cidade;
        if($scope.filial.sg_uf !== $scope.old.sg_uf) 
            jsonFilial.sg_uf = $scope.filial.sg_uf;
        if($scope.filial.nu_telefone !== $scope.old.nu_telefone) 
            jsonFilial.nu_telefone = $scope.filial.nu_telefone;

        // Envia
        $webapi.update($apis.getUrl($apis.cliente.empresa, undefined,
                                  {id: 'token', valor: $scope.token}), jsonFilial)
                .then(function(dados){
                    // Reseta os dados
                    resetaVariaveis();
                    // Hide progress
                    $scope.hideProgress(divPortletBodyFilialCadPos);
                    // Volta para a tela de Usuários
                    $scope.goAdministrativoFiliais();
                    // Exibe a mensagem de sucesso
                    $timeout(function(){$scope.showAlert('Filial alterada com sucesso!', true, 'success', true)}, 500);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar a filial (' + failData.status + ')', true, 'danger', true);
                     // Hide progress
                     $scope.hideProgress(divPortletBodyFilialCadPos);
                  });    
   };                                                      
    
    
}]);