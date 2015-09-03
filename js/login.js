/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão: 1.0 - 03/09/2015
 *
 */

var app = angular.module("Login", ['diretivas', 'utils']);

app.controller("loginCtrl", ['$scope',
                             '$window',
                             '$webapi',
                             '$autenticacao',
                             '$empresa',
                             function($scope,$window,$webapi,$autenticacao,$empresa){ 

    // Dados da empresa
    $scope.empresa = $empresa;
    // Usuário
    $scope.usuario = { nome: '', senha: '' };
    $scope.lembrar = false;
    // Mensagem de erro
    $scope.mensagemErro = 'Entre com o usuário e a senha.';   
    $scope.exibeMensagemErro = false;     
    // Form
    var current = 'login'; // form em exibição ('login', 'esqueci-senha', 'cadastro')  
    // Esqueci a senha
    $scope.esquecisenha = {email : ''};     
    // Cadastro
    // ....                             
    // URL das páginas
    var paginaRedirecionamento = 'app/'; // página de redirecionamento                        
    // flags
    $scope.exibeLayout = false; // flag para indicar se o layout pode ser exibido completamente
    $scope.efetuandoLogin = false;
    $scope.manutencao = false;
                                 
    /**
      * Acessa a página principal
      */                              
    var redirecionaPagina = function(){
        // Redireciona
        $window.location.replace(paginaRedirecionamento);
    }; 
    /**
      * Exibe o layout e inicializa seus handlers
      */
    var exibeLayout = function(){
      // Inicializa todos os handlers de layout 
      angular.element(document).ready(function(){ 
      //$scope.$on('$viewContentLoaded', function(){
            //$scope.exibeLayout = true; // não funciona aqui
            Metronic.init(); // init metronic core components
            //Login.init();
        });
        $scope.exibeLayout = true;
    };
                                  

    /**
      * Inicialização do controller
      */                              
    $scope.init = function(){
        if($autenticacao.usuarioEstaAutenticado()){
            // Avalia Token
            $webapi.get($autenticacao.autenticacao.login + '/' + $autenticacao.getToken())
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                        redirecionaPagina();
                    },
                    function(failData){
                      // Avaliar código de erro
                      if(failData.status == 500){
                          // Código 500 => Token já não é mais válido
                          $autenticacao.removeDadosDeAutenticacao();
                      }else if(failData.status === 0 || 
                               failData.status === 503 || 
                               failData.status === 404) 
                          $scope.manutencao = true;
                      else 
                          console.log("FALHA AO VALIDAR TOKEN: " + failData.status);
                          // o que fazer? exibir uma tela indicando falha de comunicação?
                      exibeLayout();
                    });
        }else{ 
            // Verifica se tem conexão com o servidor
            $webapi.get($autenticacao.apiStatus)
                .then(function(dados){
                      exibeLayout();
                    },
                    function(failData){
                      // Avaliar código de erro
                      if(failData.status === 0 || 
                         failData.status === 503 || 
                         failData.status === 404) 
                          $scope.manutencao = true;
                      else console.log("ERRO AO AVALIAR STATUS DA API: " + failData.status);
                      exibeLayout();
                    });
        }
    };
                                  
                                  
    // FORMS
    /**
      * Retorna true se estiver exibindo o form de login
      */
    $scope.formExibidoEhLogin = function(){
        return current === 'login';    
    };
    /**
      * Retorna true se estiver exibindo o form esqueci a senha
      */                             
    $scope.formExibidoEhEsqueciSenha = function(){
        return current === 'esqueci-senha';    
    };
    /**
      * Retorna true se estiver exibindo o form de cadastro
      */                             
    $scope.formExibidoEhCadastro = function(){
        return current === 'cadastro';    
    };                                 
    /**
      * Exibe o form de login
      */ 
    $scope.exibeFormLogin = function(){
        current = 'login';    
    };
    /**
      * Exibe o form esqueci a senha
      */                             
    $scope.exibeFormEsqueciSenha = function(){
        current = 'esqueci-senha';    
    };
    /**
      * Exibe o form de cadastro
      */                             
    $scope.exibeFormCadastro = function(){
        current = 'cadastro';    
    }; 
                                  
          
                                 
                                  
    // LOGIN                              
    /**
      * Reporta se está em progresso de autenticação
      */                                
    var progressoLogin = function(emProgresso){
        $scope.efetuandoLogin = emProgresso;
        if(!$scope.$$phase) $scope.$apply();
    };
    /**
      * Efetua login
      */
    $scope.efetuaLogin = function() {
        
        // Valida login e senha
        if(!$scope.usuario.nome || !$scope.usuario.senha){
            $scope.mensagemErro = 'Entre com o usuário e a senha.';
            $scope.exibeMensagemErro = true;    
            return;
        }
        
        $scope.exibeMensagemErro = false;
        
        progressoLogin(true);
        // VALIDA LOGIN
        var jsonAutenticacao = { usuario: $scope.usuario.nome, senha: $scope.usuario.senha };
        // Envia os dados para autenticação
        //$.post($autenticacao.autenticacao.login, jsonAutenticacao)
        $webapi.post($autenticacao.autenticacao.login, jsonAutenticacao)
            .then(function(data){
            //.done(function(data){
                // LOGADO! => Vai para a página principal
                // Atualiza dados de autenticação
                $autenticacao.atualizaDadosDeAutenticacao(data.token,$scope.lembrar,new Date());
                // Redireciona e atualiza último horário de autenticação
                redirecionaPagina();
                // Esconde Progress
                progressoLogin(false);
              }//).fail(function(failData){
              , function(failData){
                  if(failData.status === 0)
                      $scope.mensagemErro = 'Falha de comunicação com o servidor.';
                  else if(failData.status === 401)
                      $scope.mensagemErro = 'Sua conta está desativada. Por favor, entre em contato para mais informações através do ' + $empresa.telefone + '  ou ' + $empresa.email;
                  else if(failData.status === 500)
                      $scope.mensagemErro = 'Usuário e/ou senha inválido(s).';
                  else if(failData.status === 503 || failData.status === 404) $scope.manutencao = true;
                  // Exibe a mensagem de erro
                  $scope.exibeMensagemErro = true;
                  // Esconde Progress
                  progressoLogin(false);
              });       
    };
                                 
                                 
    
    // ESQUECI A SENHA
    $scope.enviaEmail = function(){
        if(!$scope.esquecisenha.email){
            // e-mail inválido!
            return;
        };
        // envia ....
    };
}]);